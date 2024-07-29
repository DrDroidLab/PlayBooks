import IntegrationCard from "../common/IntegrationCard";

const TabContent = (props: any) => {
  const { id, title, cards } = props;

  return (
    <div className="font-light text-base max-w-full" key={id}>
      <div className="flex items-center mx-5 max-w-full gap-2">
        <h1 className="text-gray-400 text-sm shrink-0">{title}</h1>
        <hr className="border-t-gray-200 flex-1" />
      </div>
      <div className="mt-4">
        <div className="flex flex-wrap">
          {cards?.map((card, index) => (
            <IntegrationCard key={index} data={card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabContent;
