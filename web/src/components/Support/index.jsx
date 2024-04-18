import React from 'react';

import Heading from '../Heading';

import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';

import SlackIcon from '../../data/slack.png';

import { Button, Card, CardContent, Typography } from '@mui/material';

const Support = () => {
  const openIntercom = () => {
    window.Intercom('showNewMessage');
  };

  return (
    <div>
      <Heading heading={'Support'} onTimeRangeChangeCb={false} onRefreshCb={false} />

      {/* Row with Three Cards */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
        {/* Card 1 */}
        <Card style={{ width: '32%' }}>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ChatOutlinedIcon />
              <Typography variant="h6" style={{ fontWeight: '600', marginLeft: '5px' }}>
                Live Chat
              </Typography>
            </div>
            <Typography variant="body2" style={{ marginTop: '5px', marginBottom: '10px' }}>
              Get quick support from the entire Doctor Droid team on live chat
            </Typography>
            <Button variant="outlined" onClick={openIntercom}>
              Launch Chat
            </Button>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card style={{ width: '32%' }}>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={SlackIcon} alt="Slack Logo" style={{ width: '18px' }} />
              <Typography variant="h6" style={{ fontWeight: '600', marginLeft: '5px' }}>
                Slack Connect
              </Typography>
            </div>
            <Typography variant="body2" style={{ marginTop: '5px', marginBottom: '10px' }}>
              Invite your team to collaborate in a shared Slack channel
            </Typography>
            <Button
              variant="outlined"
              href="mailto:support@drdroid.io?subject=Requesting%20a%20Slack%20Connect%20Channel&body=Hi%20there!%20I%27d%20like%20to%20request%20a%20Slack%20Connect%20channel%20for%20our%20team.%20Or%2C%20if%20one%20exists%2C%20please%20add%20me!%0D%0A%0D%0AThanks%20%3A)"
              target="_blank"
            >
              Request Slack Connect
            </Button>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card style={{ width: '32%' }}>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <EmailOutlinedIcon />
              <Typography variant="h6" style={{ fontWeight: '600', marginLeft: '5px' }}>
                Email
              </Typography>
            </div>
            <Typography variant="body2" style={{ marginTop: '5px', marginBottom: '10px' }}>
              Send an email to our shared inbox and we'll get back to you ASAP
            </Typography>
            <Button
              variant="outlined"
              href="mailto:support@drdroid.io?subject=Support%20Inquiry"
              target="_blank"
            >
              Send Email
            </Button>
          </CardContent>
        </Card>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
        <Card style={{ width: '32%' }}>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ArticleOutlinedIcon />
              <Typography variant="h6" style={{ fontWeight: '600', marginLeft: '5px' }}>
                Documentation
              </Typography>
            </div>
            <Typography variant="body2" style={{ marginTop: '5px', marginBottom: '10px' }}>
              Check the documentation for all of our features and integrations
            </Typography>
            <Button
              variant="outlined"
              href="https://docs.drdroid.io/docs/alerts-insights"
              target="_blank"
            >
              See Docs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;
