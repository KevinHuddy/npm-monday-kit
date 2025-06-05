import { ApiParams, Client } from "./common/client"
import { CreateItemParams, GetItemParams, GetItemsByColumnValuesParams, ItemService, UpdateItemParams } from "./services/item-service"
import { GetSubitemsParams, SubitemService } from "./services/subitem-service"
import { BoardService, ListBoardColumnsParams, ListBoardGroupsParams } from "./services/board-service"
import { ListWorkspaceBoardsParams, WorkspaceService } from "./services/workspace-service"
import { GetUserByEmailParams, GetUserByIdParams, UserService } from "./services/user-service"
import { CreateUpdateParams, UpdateService } from "./services/update-service"

export class MondayClient {
    private baseClient: Client
    
    public readonly items: ItemService
    public readonly boards: BoardService
    public readonly workspaces: WorkspaceService
    public readonly users: UserService
    public readonly updates: UpdateService
    public readonly subitems: SubitemService

    constructor(apiKey: string, apiVersion: string = "2025-04") {
        this.baseClient = new Client(apiKey, apiVersion)
        this.items = new ItemService(this.baseClient)
        this.subitems = new SubitemService(this.baseClient)
        this.boards = new BoardService(this.baseClient)
        this.workspaces = new WorkspaceService(this.baseClient)
        this.users = new UserService(this.baseClient)
        this.updates = new UpdateService(this.baseClient)
    }

    // Base Client
    api = async <T>(params: ApiParams) => this.baseClient.api<T>(params)

    // Item Service
    getItem = async (params: GetItemParams) => this.items.getItem(params)
    updateItem = async (params: UpdateItemParams) => this.items.updateItem(params)
    createItem = async (params: CreateItemParams) => this.items.createItem(params)
    getItemsByColumnValues = async (params: GetItemsByColumnValuesParams) => this.items.getItemsByColumnValues(params)

    // Subitem Service
    getSubitems = async (params: GetSubitemsParams) => this.subitems.getSubitems(params)

    // Update Service
    createUpdate = async (params: CreateUpdateParams) => this.updates.createUpdate(params)

    // User Service
    listUsers = async () => this.users.listUsers()
    getUserById = async (params: GetUserByIdParams) => this.users.getUserById(params)
    getUserByEmail = async (params: GetUserByEmailParams) => this.users.getUserByEmail(params)

    // Workspace Service
    listWorkspaces = async () => this.workspaces.listWorkspaces()
    listWorkspaceBoards = async (params: ListWorkspaceBoardsParams) => this.workspaces.listWorkspaceBoards(params)
    
    // Board Service
    listBoardColumns = async (params: ListBoardColumnsParams) => this.boards.listBoardColumns(params)
    listBoardGroups = async (params: ListBoardGroupsParams) => this.boards.listBoardGroups(params)
}