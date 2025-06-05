import { Client } from "../common/client"
import { mondayGraphQLQueries } from "../common/queries"
import { Column, Group } from "../common/models"

export interface ListBoardColumnsParams {
    id: string
}

export interface ListBoardGroupsParams {
    id: string
}

export class BoardService {
    constructor(private baseClient: Client) {}

    async listBoardColumns(params: ListBoardColumnsParams): Promise<Column[]> {
        if (!params.id) throw new Error("Board ID is required")

        const response = await this.baseClient.api<{ boards: { columns: Column[] }[] }>(
            {
                query: mondayGraphQLQueries.listBoardColumns,
                variables: { boardId: params.id }
            }
        )

        return response.boards[0]?.columns || []
    }

    async listBoardGroups(params: ListBoardGroupsParams): Promise<Group[]> {
        if (!params.id) throw new Error("Board ID is required")

        const response = await this.baseClient.api<{ boards: { groups: Group[] }[] }>(
            {
                query: mondayGraphQLQueries.listBoardGroups,
                variables: { boardId: params.id }
            }
        )

        return response.boards[0]?.groups || []
    }
} 