import * as path from "path";
import * as vscode from "vscode";
import { QueryUnit } from "../../database/QueryUnit";
import { Node } from "../interface/node";
import { DatabaseCache } from "../../database/DatabaseCache";
import { ModelType, Constants } from "../../common/Constants";
import { ConnectionInfo } from "../interface/connection";
import { ConnectionManager } from "../../database/ConnectionManager";
import { MySQLTreeDataProvider } from "../../provider/MysqlTreeDataProvider";
import { Util } from "../../common/util";


export class ProcedureNode extends Node implements  ConnectionInfo {

    public contextValue: string = ModelType.PROCEDURE;
    public iconPath = path.join(Constants.RES_PATH, "procedure.svg")
    constructor(readonly name: string, readonly info: ConnectionInfo) {
        super(name)
        this.init(info)
        // this.id = `${info.host}_${info.port}_${info.user}_${info.database}_${name}`
        this.command = {
            command: "mysql.show.procedure",
            title: "Show Procedure Create Source",
            arguments: [this, true]
        }
    }

    public async showSource() {
        QueryUnit.queryPromise<any[]>(await ConnectionManager.getConnection(this, true), `SHOW CREATE PROCEDURE \`${this.database}\`.\`${this.name}\``)
            .then((procedDtail) => {
                procedDtail = procedDtail[0]
                QueryUnit.showSQLTextDocument(`DROP PROCEDURE IF EXISTS ${procedDtail['Procedure']}; \n\n${procedDtail['Create Procedure']}`);
            });
    }

    public async getChildren(isRresh: boolean = false): Promise<Node[]> {
        return [];
    }


    public drop() {

        Util.confirm(`Are you want to drop procedure ${this.name} ? `, async () => {
            QueryUnit.queryPromise(await ConnectionManager.getConnection(this), `DROP procedure \`${this.database}\`.\`${this.name}\``).then(() => {
                DatabaseCache.clearTableCache(`${this.host}_${this.port}_${this.user}_${this.database}_${ModelType.PROCEDURE_GROUP}`)
                MySQLTreeDataProvider.refresh()
                vscode.window.showInformationMessage(`Drop procedure ${this.name} success!`)
            })
        })

    }

}
