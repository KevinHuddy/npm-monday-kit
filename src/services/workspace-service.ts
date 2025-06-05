import { Client } from "../common/client"
import { mondayGraphQLQueries } from "../common/queries"
import { Workspace, Board } from "../common/models"


export interface ListWorkspaceBoardsParams {
    workspaceId: string
}

export class WorkspaceService {
    constructor(private baseClient: Client) {}

    async listWorkspaces(): Promise<Workspace[]> {
        const response = await this.baseClient.api<{ workspaces: Workspace[] }>(
            {
                query: mondayGraphQLQueries.listWorkspaces
            }
        )
        return response.workspaces || []
    }

    async listWorkspaceBoards(params: ListWorkspaceBoardsParams): Promise<Board[]> {
        if (!params.workspaceId) throw new Error("Workspace ID is required")

        const response = await this.baseClient.api<{ boards: Board[] }>(
            {
                query: mondayGraphQLQueries.listWorkspaceBoards,
                variables: { workspaceId: params.workspaceId }
            }
        )
        
        return response.boards || []
    }
} 