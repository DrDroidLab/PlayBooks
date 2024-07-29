import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConnectorCard from '../../components/Integration/ConnectorCard';

let connector = {
    id: 39,
    url: "/integrations/sql-db-connection-logo.svg",
    title: "SQL DATABASE CONNECTION",
    enum: "SQL_DATABASE_CONNECTION",
    desc: "Connect tables from any SQL database",
    buttonTitle: "Connect",
    buttonType: "link",
    buttonLink: "/integrations/sql_database_connection",
    docs: "https://docs.drdroid.io/docs/sql-databases",
  };

test('renders the correct content', (
    
) => {
  render(<ConnectorCard connector={connector} />);
  expect(screen.getByText('SQL DATABASE CONNECTION Keys')).toBeInTheDocument();
});