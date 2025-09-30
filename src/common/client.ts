import mondaySdk from "monday-sdk-js"
import { MondayClientSdk } from 'monday-sdk-js/types/client-sdk.interface'

export interface ApiParams {
    query: string,
    variables?: Record<string, any>
}

export class Client {
    private client: MondayClientSdk

    constructor(apiKey?: string, apiVersion: string = "2025-04") {
        this.client = mondaySdk()
        apiKey && this.client.setToken(apiKey)
        this.client.setApiVersion(apiVersion)
    }

    async api<T>(params: ApiParams): Promise<T> {
        if (!params.query) throw new Error("Query is required")
        const response = await this.client.api<T>(params.query, { variables: params.variables })
        if ( response.errors ) throw new Error(response.errors.map(error => error.message).join(", "))
        return response.data
    }
} 