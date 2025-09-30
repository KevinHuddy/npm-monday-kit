import { Client } from "../common/client"
import { mondayGraphQLQueries } from "../common/queries"
import { Board, Column, Group, Item } from "../common/models"
import { parseMondayColumnValue } from "../common/helper"
import { Items } from "./item-service"

export interface ListBoardColumnsParams {
    boardId: string
}

export interface ListBoardGroupsParams {
    boardId: string
}

export interface ListBoardItemsParams {
    boardId: string,
    columnIds?: string[]
    all?: boolean
}

export class BoardService {
    constructor(private baseClient: Client) {}

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

    async listBoards(): Promise<Board[]> {
        const response = await this.baseClient.api<{ boards: Board[] }>(
            {
                query: mondayGraphQLQueries.listBoards,
            }
        )

        return response.boards || []
    }

    async listBoardColumns(variables: ListBoardColumnsParams): Promise<Column[]> {
        if (!variables.boardId) throw new Error("🚨 'boardId' is required")

        const response = await this.baseClient.api<{ boards: { columns: Column[] }[] }>(
            {
                query: mondayGraphQLQueries.listBoardColumns,
                variables
            }
        )

        return response.boards[0]?.columns || []
    }

    async listBoardGroups(variables: ListBoardGroupsParams): Promise<Group[]> {
        if (!variables.boardId) throw new Error("🚨 'boardId' is required")

        const response = await this.baseClient.api<{ boards: { groups: Group[] }[] }>(
            {
                query: mondayGraphQLQueries.listBoardGroups,
                variables
            }
        )

        return response.boards[0]?.groups || []
    }

    async listBoardItems(variables: ListBoardItemsParams, displayValue: boolean = false): Promise<Items> {
        if (!variables.boardId) throw new Error("🚨 'boardId' is required")

        if (variables.all) {
            let allItems = []
            let currentCursor: string | null = null

            const firstPage = await this.baseClient.api<{ boards: { items_page: { items: Item[], cursor: string } }[], complexity: { query: number } }>(
                {
                    query: mondayGraphQLQueries.listBoardItems,
                    variables
                }
            )
            console.log(firstPage.complexity)
            allItems.push(...firstPage.boards?.[0]?.items_page?.items || [])
            currentCursor = firstPage.boards?.[0]?.items_page?.cursor || null

            while (currentCursor) {
                const nextPage = await this.baseClient.api<{ next_items_page: { items: Item[], cursor: string } }>(
                    {
                        query: mondayGraphQLQueries.listNextItems,
                        variables: {
                            cursor: currentCursor,
                            ...variables
                        }
                    }
                )
                allItems.push(...nextPage.next_items_page?.items || [])
                currentCursor = nextPage.next_items_page?.cursor || null
            }

            return this.transformItems(allItems, displayValue)
        }

        const response = await this.baseClient.api<{ boards: { items_page: { items: Item[] } }[] }>(
            {
                query: mondayGraphQLQueries.listBoardItems,
                variables
            }
        )

        const items = response.boards[0]?.items_page?.items || []
        return this.transformItems(items, displayValue)
    }
} 