import React from 'react';
import classnames from 'classnames';
import TextFieldWrap from './TextFieldWrap';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { useChipFormatter } from '../game/ChipFormatter';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        amtCont: {
            display: 'flex',
        },
        field: {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
        },
        minMaxButtonCont: {
            display: 'flex',
            flexDirection: 'column',
        },
        minMaxButton: {
            minWidth: 80,
            height: '50%',
            fontSize: 12.8,
            padding: '0 8px',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
        },
    }),
);

function FieldWithMinMaxButtons(props) {
    const classes = useStyles();
    const { onChange, className, min, max, ...rest } = props;
    const ChipFormatter = useChipFormatter();

    const onClickMin = (event) => {
        if (typeof onChange === 'function') {
            onChange({ target: { value: min } });
        }
    };

    const onClickMax = (event) => {
        if (typeof onChange === 'function') {
            onChange({ target: { value: max } });
        }
    };
    return (
        <div className={classnames(classes.amtCont, className)}>
            <TextFieldWrap
                className={classes.field}
                variant="filled"
                onChange={onChange}
                min={min}
                max={max}
                type="number"
                chipsField
                {...rest}
                InputProps={{
                    className: classes.field,
                }}
            />
            <ButtonGroup orientation="vertical" variant="contained" className={classes.minMaxButtonCont}>
                <Button className={classes.minMaxButton} onClick={onClickMax}>{`Max ${ChipFormatter(max)}`}</Button>
                <Button className={classes.minMaxButton} onClick={onClickMin}>{`Min ${ChipFormatter(min)}`}</Button>
            </ButtonGroup>
        </div>
    );
}

export default FieldWithMinMaxButtons;
