import { ApiParams, Client } from "./common/client"
import { CreateItemParams, GetItemParams, ListItemsByColumnValuesParams, ItemService, UpdateItemParams, DeleteItemParams } from "./services/item-service"
import { ListSubitemsParams, SubitemService } from "./services/subitem-service"
import { BoardService, ListBoardColumnsParams, ListBoardGroupsParams, ListBoardItemsParams } from "./services/board-service"
import { ListWorkspaceBoardsParams, WorkspaceService } from "./services/workspace-service"
import { GetUserByEmailParams, GetUserByIdParams, UserService } from "./services/user-service"
import { CreateUpdateParams, UpdateService } from "./services/update-service"

export class MondayClient {
    protected baseClient: Client
    
    public readonly item: ItemService
    public readonly board: BoardService
    public readonly workspace: WorkspaceService
    public readonly user: UserService
    public readonly update: UpdateService
    public readonly subitem: SubitemService

    constructor(apiKey: string, apiVersion: string = "2025-04") {
        this.baseClient = new Client(apiKey, apiVersion)
        this.item = new ItemService(this.baseClient)
        this.subitem = new SubitemService(this.baseClient)
        this.board = new BoardService(this.baseClient)
        this.workspace = new WorkspaceService(this.baseClient)
        this.user = new UserService(this.baseClient)
        this.update = new UpdateService(this.baseClient)
    }

    // Base Client
    api = async <T>(params: ApiParams) => this.baseClient.api<T>(params)

    items = {
        get: async (params: GetItemParams) => this.item.getItem(params),
        update: async (params: UpdateItemParams) => this.item.updateItem(params),
        create: async (params: CreateItemParams) => this.item.createItem(params),
        listByColumnValues: async (params: ListItemsByColumnValuesParams) => this.item.listItemsByColumnValues(params),
        delete: async (params: DeleteItemParams) => this.item.deleteItem(params)
    }

    subitems = {
        list: async (params: ListSubitemsParams) => this.subitem.listSubitems(params)
    }

    updates = {
        create: async (params: CreateUpdateParams) => this.update.createUpdate(params)
    }

    users = {
        list: async () => this.user.listUsers(),
        getById: async (params: GetUserByIdParams) => this.user.getUserById(params),
        getByEmail: async (params: GetUserByEmailParams) => this.user.getUserByEmail(params)
    }

    workspaces = {
        list: async () => this.workspace.listWorkspaces(),
        listBoards: async (params: ListWorkspaceBoardsParams) => this.workspace.listWorkspaceBoards(params)
    }

    boards = {
        listColumns: async (params: ListBoardColumnsParams) => this.board.listBoardColumns(params),
        listGroups: async (params: ListBoardGroupsParams) => this.board.listBoardGroups(params),
        listItems: async (params: ListBoardItemsParams) => this.board.listBoardItems(params)
    }
}