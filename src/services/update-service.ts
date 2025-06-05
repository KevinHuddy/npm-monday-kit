import { Client } from "../common/client"
import { mondayGraphQLMutations } from "../common/mutations"

export interface CreateUpdateParams {
    itemId: string,
    updateBody: string
}
export class UpdateService {
    constructor(private baseClient: Client) {}

    async createUpdate(params: CreateUpdateParams): Promise<string> {
        if (!params.itemId) throw new Error("🚨 'itemId' is required")
        if (!params.updateBody) throw new Error("🚨 'updateBody' is required")

        const response = await this.baseClient.api<{ create_update: { id: string } }>(
            {
                query: mondayGraphQLMutations.createUpdate,
                variables: params
            }
        )
        
        return response.create_update.id
    }   
} 