import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import get from 'lodash/get';
import { getLedger } from './api/http';

import { makeStyles } from '@material-ui/core/styles';
import { UILedger, UILedgerRow } from './shared/models/state/ledger';
import { ErrorDisplay } from './shared/models/ui/uiState';
import { parseHTTPParams } from './shared/util/util';
import ErrorMessage from './ErrorMessage';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';

import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    table: {
        minWidth: 750,
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
}));

const useStylesLedger = makeStyles((theme) => ({
    root: {
        height: '100vh',
        width: '100vw',
        color: 'white',
        ...theme.custom.BACKGROUND,
    },
}));

function Ledger(props) {
    const classes = useStylesLedger();
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
        return <LedgerTable ledger={ledger} />;
    }

    return <div className={classes.root}>{render()}</div>;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
    disablePadding: boolean;
    id: keyof UILedgerRow;
    label: string;
    numeric: boolean;
}

const headCells: HeadCell[] = [
    { id: 'aliases', numeric: false, disablePadding: true, label: 'Name/Aliases' },
    { id: 'buyins', numeric: false, disablePadding: false, label: 'Buy-Ins' },
    { id: 'totalBuyin', numeric: true, disablePadding: false, label: 'Total Buy-In' },
    { id: 'walkaway', numeric: true, disablePadding: false, label: 'Walkaway' },
    { id: 'net', numeric: true, disablePadding: false, label: 'Winnings/Losses' },
    { id: 'currentChips', numeric: true, disablePadding: false, label: 'Current Stack' },
    { id: 'handsDealtIn', numeric: true, disablePadding: false, label: 'Hands Dealt in' },
    { id: 'handsWon', numeric: true, disablePadding: false, label: 'Hands Won' },
    { id: 'flopsSeen', numeric: true, disablePadding: false, label: 'Flops Seen' },
    { id: 'vpip', numeric: true, disablePadding: false, label: 'Flops Seen %' },
    { id: 'timeStartedPlaying', numeric: false, disablePadding: false, label: 'Time Started Playing' },
    { id: 'timeMostRecentHand', numeric: false, disablePadding: false, label: 'Time Last Played' },
];

interface LedgerTableProps {
    classes: ReturnType<typeof useStyles>;
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof UILedgerRow) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

function LedgerTableHead(props: LedgerTableProps) {
    const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = (property: keyof UILedgerRow) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={() => onSelectAllClick}
                    />
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'default'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={() => createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <span className={classes.visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </span>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

function formatTimestamp(timestamp: number){
    return new Date(timestamp).toLocaleString().replace(',','');
}

function LedgerTable(props) {
    const classes = useStyles();
    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof UILedgerRow>('aliases');
    const [selected, setSelected] = React.useState<string[]>([]);
    const ledger: UILedgerRow[] = props.ledger;

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property as keyof UILedgerRow);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelecteds = ledger.map((n) => n.aliases);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        }
        setSelected(newSelected);
    };

    const isSelected = (name: string) => selected.indexOf(name) !== -1;

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <TableContainer>
                    <Table
                        className={classes.table}
                        aria-labelledby="tableTitle"
                        size={'medium'}
                        aria-label="enhanced table"
                    >
                        <LedgerTableHead
                            classes={classes}
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={(event) => handleSelectAllClick(event)}
                            onRequestSort={(event, property) => handleRequestSort(event, property)}
                            rowCount={ledger.length}
                        />
                        <TableBody>
                            {stableSort(ledger, getComparator(order, orderBy)).map((row, index) => {
                                const isItemSelected = isSelected(row.aliases);
                                const labelId = `enhanced-table-checkbox-${index}`;

                                return (
                                    <TableRow
                                        hover
                                        onClick={(event) => handleClick(event, row.aliases)}
                                        role="checkbox"
                                        aria-checked={isItemSelected}
                                        tabIndex={-1}
                                        key={row.aliases}
                                        selected={isItemSelected}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={isItemSelected}
                                                inputProps={{ 'aria-labelledby': labelId }}
                                            />
                                        </TableCell>
                                        <TableCell component="th" id={labelId} scope="row" padding="none">
                                            {row.aliases}
                                        </TableCell>
                                        <TableCell align="right">{row.buyins}</TableCell>
                                        <TableCell align="right">{row.totalBuyin}</TableCell>
                                        <TableCell align="right">{row.walkaway}</TableCell>
                                        <TableCell align="right">{row.net}</TableCell>
                                        <TableCell align="right">{row.currentChips}</TableCell>
                                        <TableCell align="right">{row.handsDealtIn}</TableCell>
                                        <TableCell align="right">{row.handsWon}</TableCell>
                                        <TableCell align="right">{row.flopsSeen}</TableCell>
                                        <TableCell align="right">{row.vpip}</TableCell>
                                        <TableCell align="right">{formatTimestamp(row.timeStartedPlaying)}</TableCell>
                                        <TableCell align="right">{formatTimestamp(row.timeMostRecentHand)}</TableCell>
                                    </TableRow>
                                );
                            })}
                            {
                                <TableRow style={{ height: 53 }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </div>
    );
}

export default Ledger;
