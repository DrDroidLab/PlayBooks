import { TableCell, TableRow } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton } from '@mui/material';

import { Link } from 'react-router-dom';

const functions = {
  parsedValue: value => {
    let ret = false;
    if (value?.string_value) {
      ret = value?.string_value;
    } else if (value?.bool_value === true || value?.bool_value === false) {
      ret = value?.bool_value + '';
    } else if (value?.int_value) {
      ret = Number(value?.int_value);
    } else if (value?.double_value) {
      ret = parseFloat(value?.double_value);
    } else if (value?.bytes_value) {
      ret = value?.bytes_value;
    } else if (value?.array_value) {
      var arr = [];
      for (var i = 0; i < value?.array_value.values.length; i++) {
        arr.push(functions.parsedValue(value?.array_value.values[i]));
      }
      ret = arr;
    } else if (value?.kvlist_value) {
      const nestedKvs = {};
      for (i = 0; i < value?.kvlist_value.values.length; i++) {
        nestedKvs[value?.kvlist_value.values[i]['key']] = functions.parsedValue(
          value?.kvlist_value.values[i]['value']
        );
      }
      ret = nestedKvs;
    }
    return ret;
  },

  renderEventKvs: e => {
    if (e.kvs === undefined) {
      return;
    }
    return e.kvs.map(kv => (
      <TableRow key={`payload-${e.id}-${kv.key}`}>
        <TableCell component="th" scope="row">
          {kv.key}
        </TableCell>
        <TableCell sx={{ display: 'table-cell' }}>
          <pre>{functions.parsedValue(kv.value) || ''}</pre>
        </TableCell>
      </TableRow>
    ));
  },

  renderEventPayload: e => {
    if (e.payload === undefined) {
      return;
    }

    return Object.keys(e.payload).map(key => (
      <TableRow key={`payload-${key}`}>
        <TableCell component="th" scope="row">
          {key}
        </TableCell>
        <TableCell>{JSON.stringify(e.payload[key])}</TableCell>
      </TableRow>
    ));
  }
};

export default functions;
