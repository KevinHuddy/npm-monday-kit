import { Client } from "../common/client"
import { mondayGraphQLQueries } from "../common/queries"
import { mondayGraphQLMutations } from "../common/mutations"
import { Column, Item } from "../common/models"
import { convertValueToMondayValue, generateColumnIdTypeMap, parseMondayColumnValue } from "../common/helper"
import { MondayColumnType, MondayNotWritableColumnType } from "../common/constants"

export interface ListBoardColumnsParams {
    boardId: string
}
export interface GetItemParams {
    itemId: string,
    columnIds?: string[]
}
export interface ListItemsByColumnValuesParams {
    boardId: string,
    columns: Record<string, string | string[]>,
    limit?: number,
    columnIds?: string[]
}
export interface CreateItemParams {
    itemName: string,
    boardId: string,
    groupId?: string,
    columnValues?: Record<string, any>,
    createLabels?: boolean
}
export interface UpdateItemParams {
    itemId: string,
    columnValues: Record<string, any>,
    boardId: string,
    createLabels?: boolean
}
export interface DeleteItemParams {
    itemId: string
}
export type Items = Record<string, any>[]

export class ItemService {
    private boardColumnsCache = new Map<string, Column[]>()

    constructor(private baseClient: Client) {}

    async getItem(params: GetItemParams, displayValue: boolean = false): Promise<Items> {
        if (!params.itemId) throw new Error("🚨 'itemId' is required")
            
        const response = await this.baseClient.api<{ items: Item[] }>(
            {
                query: mondayGraphQLQueries.getItem,
                variables: params
            }
        )
        const items = response.items || []
        return this.transformItems(items, displayValue)
    }
    
    async createItem(params: CreateItemParams): Promise<string> {
        if (!params.itemName) throw new Error("🚨 'itemName' is required")
        if (!params.boardId) throw new Error("🚨 'boardId' is required")

        const mondayColumnValues = await this.processColumnValues(
            params.boardId, 
            params.columnValues || {}
        )

        const response = await this.baseClient.api<{ create_item: { id: string } }>(
            {
                query: mondayGraphQLMutations.createItem,
                variables: {
                    itemName: params.itemName,
                    boardId: params.boardId,
                    groupId: params.groupId,
                    columnValues: JSON.stringify(mondayColumnValues),
                    createLabels: params.createLabels ?? false
                }
            }
        )
        return response.create_item.id
    }

    async deleteItem(params: DeleteItemParams): Promise<string> {
        if (!params.itemId) throw new Error("🚨 'itemId' is required")
        const response = await this.baseClient.api<{ delete_item: { id: string } }>(
            {
                query: mondayGraphQLMutations.deleteItem,
                variables: params
            }
        )
        return response.delete_item.id
    }

    async updateItem(params: UpdateItemParams): Promise<string> {
        if (!params.itemId) throw new Error("🚨 'itemId' is required")
        if (!params.columnValues) throw new Error("🚨 'columnValues' is required")
        if (!params.boardId) throw new Error("🚨 'boardId' is required")

        const mondayColumnValues = await this.processColumnValues(
            params.boardId, 
            params.columnValues
        )

        const response = await this.baseClient.api<{ change_multiple_column_values: { id: string } }>(
            {
                query: mondayGraphQLMutations.updateItem,
                variables: {
                    itemId: params.itemId,
                    boardId: params.boardId,
                    columnValues: JSON.stringify(mondayColumnValues),
                    createLabels: params.createLabels  ?? false
                }
            }
        )
        console.log(JSON.stringify(mondayColumnValues))
        console.log(response)
        return response.change_multiple_column_values.id
    }

    async listItemsByColumnValues(params: ListItemsByColumnValuesParams, displayValue: boolean = false): Promise<Items> {
        if (!params.boardId) throw new Error("🚨 'boardId' is required")
        if (!params.columns) throw new Error("🚨 'columns' is required")
            
        const response = await this.baseClient.api<{ items_page_by_column_values: { items: Item[] } }>(
            {
                query: mondayGraphQLQueries.listItemsByColumnValues,
                variables: {
                    boardId: params.boardId,
                    columns: Object.entries(params.columns).map(([columnId, value]) => ({
                        column_id: columnId,
                        column_values: Array.isArray(value) ? value : [value]
                    })),
                    limit: params.limit,
                    columnIds: params.columnIds
                }
            }
        )

        const items = response.items_page_by_column_values.items || []
        return this.transformItems(items, displayValue)
    }

    /**
     * Transforms raw Monday.com items into a standardized format
     */
    private transformItems(items: Item[], displayValue: boolean = false): Items {
        return items.map(item => {
            const transformedValues: Record<string, any> = {
                id: item.id,
                name: item.name,
            }
            
            for (const column of item.column_values) {
                transformedValues[column.id] = parseMondayColumnValue(column, displayValue)
            }
            
            return transformedValues
        })
    }

    /**
     * Gets board columns with caching to reduce API calls
     */
    private async listBoardColumns(params: ListBoardColumnsParams): Promise<Column[]> {
        if (this.boardColumnsCache.has(params.boardId)) {
            return this.boardColumnsCache.get(params.boardId)!
        }

        const response = await this.baseClient.api<{ boards: { columns: Column[] }[] }>(
            {
                query: mondayGraphQLQueries.listBoardColumns,
                variables: params
            }
        )
        
        const columns = response.boards[0]?.columns || []
        this.boardColumnsCache.set(params.boardId, columns)
        return columns
    }

    /**
     * Processes and validates column values for create/update operations
     */
    private async processColumnValues(
        boardId: string, 
        columnValues: Record<string, any>
    ): Promise<Record<string, any>> {
        if (Object.keys(columnValues).length === 0) {
            return {}
        }

        const columns = await this.listBoardColumns({ boardId })
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
            
            const columnType = columnIdTypeMap[key]
            if (MondayNotWritableColumnType.includes(columnType as MondayColumnType)) {
                continue
            }
            mondayColumnValues[key] = 
                (value == '' || value == null) 
                ? null 
                : convertValueToMondayValue(columnType, value)
        }
        return mondayColumnValues
    }

    /**
     * Validates column IDs against available board columns
     */
    private validateColumnIds(
        columnValues: Record<string, any>, 
        columnIdTypeMap: Record<string, string>
    ): { validKeys: string[], invalidKeys: string[] } {
        const allKeys = Object.keys(columnValues).filter(key => key !== 'id')
        const validKeys = allKeys.filter(columnId => columnId in columnIdTypeMap)
        const invalidKeys = allKeys.filter(columnId => !(columnId in columnIdTypeMap))
        
        return { validKeys, invalidKeys }
    }

    /**
     * Clears the board columns cache for a specific board or all boards
     */
    public clearCache(boardId?: string): void {
        if (boardId) {
            this.boardColumnsCache.delete(boardId)
        } else {
            this.boardColumnsCache.clear()
        }
    }
}