import { fireEvent, screen } from "@testing-library/react";
import { render } from "../testUtils";
import "@testing-library/jest-dom";
import ConnectorCard from "../../components/Integration/ConnectorCard";
import { IntegrationStatus } from "../../store/features/integrations/types/integrationStatus";

let connector = {
  id: "39",
  url: "/integrations/sql-db-connection-logo.svg",
  title: "SQL DATABASE CONNECTION",
  enum: "SQL_DATABASE_CONNECTION",
  desc: "Connect tables from any SQL database",
  buttonTitle: "Connect",
  buttonType: "link",
  buttonLink: "/integrations/sql_database_connection",
  docs: "https://docs.drdroid.io/docs/sql-databases",
  imgUrl: "",
  buttonText: "",
  status: IntegrationStatus.ACTIVE,
};

it("renders the enum name", () => {
  render(<ConnectorCard connector={connector} />);
  expect(screen.getByText("SQL_DATABASE_CONNECTION")).toBeInTheDocument();
});

it("renders the title", () => {
  render(<ConnectorCard connector={connector} />);
  expect(screen.getByText("SQL DATABASE CONNECTION")).toBeInTheDocument();
});

it("should navigate to the correct URL when the card is clicked", () => {
  const mockNavigate = jest.fn();
  mockNavigate.call(mockNavigate, "/data-sources/sql_database_connection/39");
  jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
  }));
  render(<ConnectorCard connector={connector} />);
  fireEvent.click(screen.getByText("View"));
  expect(mockNavigate).toHaveBeenCalledWith(
    "/data-sources/sql_database_connection/39",
  );
});
