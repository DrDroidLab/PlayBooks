import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import styles from './index.module.css';
import NoExistingTrigger from './NoExistingTrigger';
import { renderTimestamp } from '../../../utils/DateUtils';
import { ExpandMore } from '@mui/icons-material';

const AlertsTable = ({ data }) => {
  return (
    <>
      <p className="font-bold mb-2" style={{ paddingLeft: '1rem', paddingTop: '10px' }}>
        Alerts matching the search criteria
      </p>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className={styles['tableTitle']}>Title</TableCell>
            <TableCell className={styles['tableTitle']}>Timestamp</TableCell>
            <TableCell className={styles['tableTitle']}>Alert Tags</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((item, index) => (
            <TableRow
              key={index}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 }
              }}
            >
              <TableCell component="td" scope="row">
                {item.alert_title}
              </TableCell>
              <TableCell component="td" scope="row">
                {renderTimestamp(item.alert_timestamp)}
              </TableCell>
              <TableCell component="td" scope="row">
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    Details
                  </AccordionSummary>
                  <AccordionDetails>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell className={styles['tableTitle']}>Key</TableCell>
                          <TableCell className={styles['tableTitle']}>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {item.alert_tags.map((tag, index) => (
                          <TableRow key={index}>
                            <TableCell>{tag.key}</TableCell>
                            <TableCell>{tag.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
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
