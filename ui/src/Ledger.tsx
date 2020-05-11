import React, { useState, useEffect } from "react";
import { } from "./utils";
import { withRouter } from "react-router-dom";
import queryString from "query-string";


import { makeStyles } from "@material-ui/core/styles";
import { WsServer } from "./api/ws";
import { UILedger } from "./shared/models/ledger";
import { EndPoint } from "./shared/models/dataCommunication";
import { parseWSParams } from "./shared/util/util";


const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        margin: "2vmin",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        border: "1px solid black",
        padding: 12,
    },
}));


function Ledger(props) {
    const classes = useStyles();
    const [ledger, setLedger] = useState({});
    const queryParams = parseWSParams(queryString.parseUrl(props.location.search));


    useEffect(() => {
        const succ = WsServer.openWs(queryParams.gameUUID, EndPoint.LEDGER);
        if (succ) {
            WsServer.subscribe('ledger', onReceiveNewLedger);
        }
    }, []);

    const onReceiveNewLedger = (updatedLedger: UILedger) => {
        setLedger(updatedLedger);
    };

    return (
        <div>
            <pre>
                {JSON.stringify(ledger, null, 4)}
            </pre>
        </div>
    )
}

export default Ledger;
