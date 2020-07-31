import React from 'react';
import TextField from '@material-ui/core/TextField';
import NumberFormat from 'react-number-format';
import { useSelector } from 'react-redux';
import { selectUseCents } from '../store/selectors';

function TextFieldWrap(props) {
    const {
        onChange,
        type,
        min,
        max,
        minStrict,
        maxStrict = true,
        maxChars = 250,
        chipsField,
        divideBy100,
        InputProps,
        ...rest
    } = props;

    const useCents = useSelector(selectUseCents);

    function getReturnValue(current) {
        if (current.length > maxChars) {
            return current.substring(0, current.length - 1);
        }
        if (type === 'number') {
            if (current === '') {
                return 0;
            }
            let intValue = parseInt(current, 10);
            if (Number.isNaN(intValue) || current <= 0) {
                return 0;
            } else {
                if (!Number.isNaN(max) && maxStrict) {
                    intValue = Math.min(intValue, max);
                }
                if (!Number.isNaN(min) && minStrict) {
                    intValue = Math.max(intValue, min);
                }
                return intValue;
            }
        }
        return current;
    }
    const onChangeWrap = (event) => {
        const current = event.target.value;
        const returnVal = getReturnValue(current);

        if (typeof onChange === 'function') {
            onChange({ target: { value: returnVal } });
        }
    };

    function getRenderValue() {
        const value = props.value;
        if (type === 'number') {
            if (value === 0) {
                return '';
            }
        }
        return value;
    }

    return (
        <TextField
            variant="outlined"
            {...rest}
            onChange={onChangeWrap}
            value={getRenderValue()}
            type="text"
            InputProps={
                (chipsField && useCents) || divideBy100
                    ? {
                          inputComponent: DivideBy100Formatter as any,
                          ...InputProps,
                          inputProps: {
                              max: max,
                              maxStrict: maxStrict,
                          },
                      }
                    : { ...InputProps }
            }
        />
    );
}

function DivideBy100Formatter(props) {
    const { inputRef, onChange, max, maxStrict, ...other } = props;

    return (
        <NumberFormat
            {...other}
            getInputRef={inputRef}
            onValueChange={(values) => {
                onChange({
                    target: {
                        value: values.value,
                    },
                });
            }}
            isNumericString
            format={(val) => {
                let num = parseInt(val);
                if (maxStrict && !Number.isNaN(max)) num = Math.min(num, max);
                num = num / 100;
                return num.toFixed(2);
            }}
            type="tel"
        />
    );
}

export default TextFieldWrap;
