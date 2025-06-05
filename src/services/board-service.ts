import { Client } from "../common/client"
import { mondayGraphQLQueries } from "../common/queries"
import { Column, Group } from "../common/models"

export interface ListBoardColumnsParams {
    boardId: string
}

export interface ListBoardGroupsParams {
    boardId: string
}

export class BoardService {
    constructor(private baseClient: Client) {}

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
} 