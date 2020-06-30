import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import get from 'lodash/get';
import { getLedger } from '../api/http';

import { makeStyles } from '@material-ui/core/styles';
import { UILedger, UILedgerRow } from '../shared/models/state/ledger';
import { ErrorDisplay } from '../shared/models/ui/uiState';
import { parseHTTPParams, getEpochTimeMs } from '../shared/util/util';
import ErrorMessage from '../root/ErrorMessage';
import MaterialTable from 'material-table';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        width: '100vw',
        color: 'white',
        ...theme.custom.BACKGROUND,
    },

    tableCont: {
        padding: 24,
    },
}));

function Ledger(props) {
    const classes = useStyles();
    const [ledger, setLedger] = useState<UILedger>([]);
    const queryParams = parseHTTPParams(queryString.parseUrl(props.location.search));
    const [error, setError] = useState<ErrorDisplay | undefined>();

    useEffect(() => {
        document.title = 'Ledger';
        getLedger(queryParams.gameInstanceUUID, onFetchLedgerSuccess, onFetchLedgerFailure);
    }, []);

    const onFetchLedgerSuccess = (response) => {
        const error = get(response, 'data.error', false);
        if (error) {
            setError(error);
        } else {
            const ledger = get(response, 'data.ledger', []);
            setLedger(ledger);
        }
    };

    const onFetchLedgerFailure = (err) => {
        console.log(err);
    };

    function render() {
        if (error !== undefined) {
            return <ErrorMessage errorDisplay={error} />;
        }
        return <LedgerTable ledger={ledger} gameInstanceUUID={queryParams.gameInstanceUUID} />;
    }

    return (
        <div className={classes.root}>
            <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
            {render()}
        </div>
    );
}

const columns = [
    { field: 'aliases', title: 'Name' },
    { field: 'buyins', title: 'Buy-Ins' },
    { field: 'totalBuyin', title: 'Total Buy-Ins' },
    { field: 'walkaway', title: 'Walkaway' },
    { field: 'net', title: 'Net' },
    { field: 'handsDealtIn', title: 'Hands Dealt' },
    { field: 'handsWon', title: 'Hands Won' },
    { field: 'flopsSeen', title: 'Flops Seen' },
    { field: 'timeStartedPlaying', title: 'Started', defaultSort: 'desc' },
    { field: 'timeMostRecentHand', title: 'Last Played' },
] as any;

function transformLedgerData(data: UILedgerRow[]) {
    return data.map((row) => {
        const newRow: any = { ...row };
        newRow.buyins = row.buyins.replace(/,/g, ', ');
        newRow.flopsSeen = `${row.flopsSeen} (${row.vpip}%)`;
        newRow.timeStartedPlaying = new Date(row.timeStartedPlaying).toLocaleTimeString();
        newRow.timeMostRecentHand = new Date(row.timeMostRecentHand).toLocaleTimeString();
        return newRow;
    });
}
function LedgerTable(props) {
    const classes = useStyles();
    const ledger: UILedgerRow[] = props.ledger;
    const transformed = transformLedgerData(ledger);
    const gameDate = new Date(
        ledger.reduce(
            (min, row) => (row.timeStartedPlaying < min ? row.timeStartedPlaying : min),
            Number.POSITIVE_INFINITY,
        ) || getEpochTimeMs(),
    ).toLocaleDateString();

    console.log(ledger, gameDate);
    return (
        <div className={classes.tableCont}>
            <MaterialTable
                title={`Ledger for ${props.gameInstanceUUID} (${gameDate})`}
                columns={columns}
                data={transformed}
                options={{
                    sorting: true,
                    exportButton: true,
                    exportFileName: `JustPokerLedger~${gameDate}~${props.gameInstanceUUID}`,
                    paging: false,
                    search: false,
                    headerStyle: {
                        fontFamily: 'Futura',
                        fontSize: '14px',
                    },
                    rowStyle: {
                        fontFamily: 'Futura',
                        fontSize: '14px',
                    },
                }}
            />
        </div>
    );
}

export default Ledger;
