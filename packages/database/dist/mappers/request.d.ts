import { Request } from "@kancode/domain";
export interface RequestRow {
    id: string;
    workspace_id: string;
    request_text: string;
    status: string;
    version: number;
}
export declare function requestToRow(domain: Request): RequestRow;
export declare function rowToRequest(row: RequestRow): Request;
//# sourceMappingURL=request.d.ts.map