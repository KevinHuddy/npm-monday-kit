import { Client } from "../common/client"
import { mondayGraphQLQueries } from "../common/queries"
import { User } from "../common/models"

export interface GetUserByIdParams {
    id: string
}
export interface GetUserByEmailParams {
    email: string
}

export class UserService {
    constructor(private baseClient: Client) {}

    async listUsers(): Promise<User[]> {
        const response = await this.baseClient.api<{ users: User[] }>(
            {
                query: mondayGraphQLQueries.listUsers
            }
        )
        return response.users || []
    }

    async getUserById(params: GetUserByIdParams): Promise<User> {
        if (!params.id) throw new Error("ID is required")
        
        const response = await this.baseClient.api<{ users: User[] }>(
            {
                query: mondayGraphQLQueries.getUserById,
                variables: { userId: params.id }
            }
        )
        
        return response.users[0] || null
    }

    async getUserByEmail(params: GetUserByEmailParams): Promise<User> {
        if (!params.email) throw new Error("Email is required")
        
        const response = await this.baseClient.api<{ users: User[] }>(
            {
                query: mondayGraphQLQueries.getUserByEmail,
                variables: { email: params.email }
            }
        )
        
        return response.users[0] || null
    }
} 