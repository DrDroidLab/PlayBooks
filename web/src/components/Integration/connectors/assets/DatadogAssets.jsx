import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export const DataDogAssets = ({ assets }) => {
  if (assets?.length === 0) {
    return <CircularProgress />;
  }

  const services = assets?.filter(e => e.datadog_service !== undefined).map(e => e.datadog_service);
  return (
    <div>
      {services && services.length > 0 && (
        <Accordion style={{ borderRadius: '5px' }} className="collapsible_option">
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
            style={{ borderRadius: '5px', backgroundColor: '#f5f5f5' }}
          >
            <Typography>
              <p style={{ fontSize: '16px' }}>Services ({services.length})</p>{' '}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            {services.map((item, index) => (
              <Accordion key={index}>
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  style={{ borderRadius: '5px', backgroundColor: '#f5f5f5' }}
                >
                  <Typography>
                    <p style={{ fontSize: '16px' }}>{item.service_name}</p>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Metric Families</Typography>
                  {Object.entries(
                    item.metrics.reduce((acc, curr) => {
                      if (!acc[curr.metric_family]) {
                        acc[curr.metric_family] = [];
                      }
                      acc[curr.metric_family].push(curr.metric);
                      return acc;
                    }, {})
                  ).map((metric, i) => (
                    <Accordion key={i}>
                      <AccordionSummary
                        expandIcon={<ArrowDropDownIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        style={{ borderRadius: '5px', backgroundColor: '#f5f5f5' }}
                      >
                        <Typography>
                          <p style={{ fontSize: '16px' }}>{metric[0]}</p>
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List>
                          {metric[1].map(metric_name => (
                            <ListItem>
                              <ListItemText primary={metric_name} />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      )}
    </div>
  );
};
