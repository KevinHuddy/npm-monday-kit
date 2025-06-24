import mondaySdk from "monday-sdk-js"
import { MondayClientSdk } from 'monday-sdk-js/types/client-sdk.interface'

export interface ApiParams {
    query: string,
    variables?: Record<string, any>
}

export interface StorageParams {
    key: string,
    value?: string,
    operation: 'get' | 'set'
}

export class Client {
    private client: MondayClientSdk

    constructor(apiKey: string, apiVersion: string = "2025-04") {
        this.client = mondaySdk()
        this.client.setToken(apiKey)
        this.client.setApiVersion(apiVersion)
    }

    async storage<T>(params: StorageParams): Promise<T> {
        if (params.operation === 'set') {
            if (!params.value) throw new Error("Value is required for set operation")
            const response = await this.client.storage.setItem(params.key, params.value)
            return response as T
        } else if (params.operation === 'get') {
            const response = await this.client.storage.getItem(params.key)
            return response as T
        } else {
            throw new Error("Invalid operation. Must be 'get' or 'set'")
        }
    }

    async api<T>(params: ApiParams): Promise<T> {
        if (!params.query) throw new Error("Query is required")
        const response = await this.client.api<T>(params.query, { variables: params.variables })
        if ( response.errors ) throw new Error(response.errors.map(error => error.message).join(", "))
        return response.data
    }
} 