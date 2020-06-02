import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

function RadioForm(props) {
    const { className, value, label, onChange, options, radioGroupProps } = props;

    return (
        <FormControl className={className} component="fieldset">
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup value={value} onChange={onChange} {...radioGroupProps}>
                {options.map((option, index) => (
                    <FormControlLabel
                        key={option.label + index}
                        value={option.value}
                        control={<Radio />}
                        label={option.label}
                        {...option.props}
                    />
                ))}
            </RadioGroup>
        </FormControl>
    );
}

export default RadioForm;
