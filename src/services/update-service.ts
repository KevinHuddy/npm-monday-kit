import { Client } from "../common/client"
import { mondayGraphQLMutations } from "../common/mutations"

export interface CreateUpdateParams {
    id: string,
    body: string
}
export class UpdateService {
    constructor(private baseClient: Client) {}

    async createUpdate(params: CreateUpdateParams): Promise<string> {
        if (!params.id) throw new Error("ID is required")
        if (!params.body) throw new Error("Body is required")

        const response = await this.baseClient.api<{ create_update: { id: string } }>(
            {
                query: mondayGraphQLMutations.createUpdate,
                variables: {
                    itemId: params.id,
                    updateBody: params.body
                }
            }
        )
        
        return response.create_update.id
    }   
} 