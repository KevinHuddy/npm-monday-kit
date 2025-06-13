import { Client } from "../common/client"
import { mondayGraphQLQueries } from "../common/queries"
import { Column, Item } from "../common/models"
import { convertValueToMondayValue, generateColumnIdTypeMap, parseMondayColumnValue } from "../common/helper"
import { mondayGraphQLMutations } from "../common/mutations"

export interface ListSubitemsParams {
    itemId: string,
    columnIds?: string[]
}
export interface CreateSubitemParams {
    itemName: string,
    parentItemId: string,
    columnValues?: Record<string, any>,
    createLabels?: boolean
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
        parentItemId: string, 
        columnValues: Record<string, any>
    ): Promise<Record<string, any>> {
        if (Object.keys(columnValues).length === 0) {
            return {}
        }

        const boardId = await this.getSubitemBoardId(parentItemId)
        if (!boardId) throw new Error("🚨 Subitem board not found, make sure to create a subitem in the board first")

        const columns = await this.listBoardColumns(boardId)
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

    private async getSubitemBoardId(parentItemId: string): Promise<string | null> {
        const response = await this.baseClient.api<{ items: { board: { columns: { settings_str: string }[] }[] }[] }>({
            query: `query ($itemId: ID!)
            {
                items (ids: [$itemId]) 
                {
                    board 
                    {
                        columns (types: [subtasks]) {
                            settings_str
                        }
                    }
                }
            }`,
            variables: {
                itemId: parentItemId
            }
        }).then((res: any) => {
            const subtaskSettings = JSON.parse(res.items[0].board.columns?.[0]?.settings_str || '{}')
            return subtaskSettings.boardIds?.[0] || null
        })
        return response
    }

    /**
     * Gets board columns with caching to reduce API calls
     */
    private async listBoardColumns(boardId: string): Promise<Column[]> {
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

    async listSubitems(params: ListSubitemsParams): Promise<Subitems> {
        if (!params.itemId) throw new Error("🚨 'itemId' is required")

        const response = await this.baseClient.api<{ items: Item[] }>(
            {
                query: mondayGraphQLQueries.listSubitems,
                variables: params
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

    async create(params: CreateSubitemParams): Promise<string> {
        if (!params.itemName) throw new Error("🚨 'itemName' is required")
        if (!params.parentItemId) throw new Error("🚨 'parentItemId' is required")

        const mondayColumnValues = await this.processColumnValues(
            params.parentItemId, 
            params.columnValues || {}
        )

        const response = await this.baseClient.api<{ create_subitem: { id: string } }>(
            {
                query: mondayGraphQLMutations.createSubitem,
                variables: {
                    itemName: params.itemName,
                    parentItemId: params.parentItemId,
                    columnValues: JSON.stringify(mondayColumnValues),
                    createLabels: params.createLabels ?? false
                }
            }
        )
        return response.create_subitem.id
    }
    
} 