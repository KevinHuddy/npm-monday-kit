import { Client } from "../common/client"
import { mondayGraphQLQueries } from "../common/queries"
import { User } from "../common/models"

export interface GetUserByIdParams {
    userId: string
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
        if (!params.userId) throw new Error("🚨 'userId' is required")
        
        const response = await this.baseClient.api<{ users: User[] }>(
            {
                query: mondayGraphQLQueries.getUserById,
                variables: params
            }
        )

        return response.users[0] || null
    }

    async getUserByEmail(params: GetUserByEmailParams): Promise<User> {
        if (!params.email) throw new Error("🚨 'email' is required")
        
        const response = await this.baseClient.api<{ users: User[] }>(
            {
                query: mondayGraphQLQueries.getUserByEmail,
                variables: params
            }
        )
        
        return response.users[0] || null
    }
} 