import { Client } from "../common/client"
import { mondayGraphQLQueries } from "../common/queries"
import { Column, Item } from "../common/models"
import { convertValueToMondayValue, generateColumnIdTypeMap, parseMondayColumnValue } from "../common/helper"

export interface GetSubitemsParams {
    id: string,
    columnIds?: string[]
}

export type Subitems = Record<string, any>[]

export class SubitemService {
    private boardColumnsCache = new Map<string, Column[]>()

    constructor(private baseClient: Client) {}

    private validateColumnIds(
        columnValues: Record<string, any>, 
        columnIdTypeMap: Record<string, string>
    ): { validKeys: string[], invalidKeys: string[] } {
        const allKeys = Object.keys(columnValues)
        const validKeys = allKeys.filter(columnId => columnId in columnIdTypeMap)
        const invalidKeys = allKeys.filter(columnId => !(columnId in columnIdTypeMap))
        
        return { validKeys, invalidKeys }
    }

    private async processColumnValues(
        boardId: string, 
        columnValues: Record<string, any>
    ): Promise<Record<string, any>> {
        if (Object.keys(columnValues).length === 0) {
            return {}
        }

        const columns = await this.getBoardColumns(boardId)
        const columnIdTypeMap = generateColumnIdTypeMap(columns)
        
        // Validate column IDs and log warnings for non-existent ones
        const { validKeys, invalidKeys } = this.validateColumnIds(columnValues, columnIdTypeMap)
        
        if (invalidKeys.length > 0) {
            console.warn(`Invalid column IDs detected: ${invalidKeys.join(', ')}`)
        }

        // Process valid columns only
        const mondayColumnValues: Record<string, any> = {}
        for (const key of validKeys) {
            const value = columnValues[key]
            if (value !== '' && value != null) {
                const columnType = columnIdTypeMap[key]
                mondayColumnValues[key] = convertValueToMondayValue(columnType, value)
            }
        }

        return mondayColumnValues
    }

    /**
     * Gets board columns with caching to reduce API calls
     */
    private async getBoardColumns(boardId: string): Promise<Column[]> {
        if (this.boardColumnsCache.has(boardId)) {
            return this.boardColumnsCache.get(boardId)!
        }

        const response = await this.baseClient.api<{ boards: { columns: Column[] }[] }>(
            {
                query: mondayGraphQLQueries.listBoardColumns,
                variables: { boardId }
            }
        )
        
        const columns = response.boards[0]?.columns || []
        this.boardColumnsCache.set(boardId, columns)
        return columns
    }

    async getSubitems(params: GetSubitemsParams): Promise<Subitems> {
        if (!params.id) throw new Error("Parent item ID is required")

        const response = await this.baseClient.api<{ items: Item[] }>(
            {
                query: mondayGraphQLQueries.getSubitemsColumnValues,
                variables: {
                    itemId: params.id,
                    columnIds: params.columnIds
                }
            }
        )
        
        const subitems = response.items[0]?.subitems || []
        
        const result: Subitems = [];
        for (const item of subitems) {
            const transformedValues: Record<string, any> = {
                id: item.id,
                name: item.name,
            }
            for (const column of item.column_values) {
                transformedValues[column.id] = parseMondayColumnValue(column)
            }
            result.push(transformedValues)
        }
        return result;
    }
    
} 