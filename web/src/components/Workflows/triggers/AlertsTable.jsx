import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import NoExistingTrigger from "./NoExistingTrigger";
import { renderTimestamp } from "../../../utils/DateUtils";
import SeeMoreText from "../../Playbooks/SeeMoreText";

const AlertsTable = ({ data }) => {
  return (
    <>
      <p className="font-bold mb-2">Alerts matching the search criteria</p>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((item, index) => (
            <TableRow
              key={index}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}>
              <TableCell component="td" scope="row">
                <SeeMoreText text={item.alert_text} />
              </TableCell>
              <TableCell component="td" scope="row">
                {renderTimestamp(item.alert_timestamp)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!data?.length ? <NoExistingTrigger /> : null}
    </>
  );
};

export default AlertsTable;
