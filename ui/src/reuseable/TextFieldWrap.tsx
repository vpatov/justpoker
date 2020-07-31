import React from 'react';
import TextField from '@material-ui/core/TextField';
import NumberFormat from 'react-number-format';

function TextFieldWrap(props) {
    const { onChange, type, min, max, minStrict, maxStrict = true, maxChars = 250, divideBy100, ...rest } = props;

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
                divideBy100
                    ? {
                          inputComponent: DivideBy100Formatter as any,
                      }
                    : {}
            }
        />
    );
}

function DivideBy100Formatter(props) {
    const { inputRef, onChange, ...other } = props;

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
                const num = parseInt(val) / 100;
                return num.toFixed(2);
            }}
        />
    );
}

export default TextFieldWrap;
