import React from 'react';
import TextField from '@material-ui/core/TextField';

function TextFieldWrap(props) {
    const { onChange, type, min, max, minStrict, maxStrict = true, maxChars = 250, ...rest } = props;

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
                if (max && maxStrict) {
                    intValue = Math.min(intValue, max);
                }
                if (min && minStrict) {
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

    return <TextField variant="outlined" {...rest} onChange={onChangeWrap} value={getRenderValue()} type="text" />;
}

export default TextFieldWrap;
