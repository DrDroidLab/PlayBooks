function PlaybookBashActionOutput({ output }) {
  const outputs = output.command_outputs;
  return (
    <div className="max-w-xl overflow-scroll bg-white p-2 border rounded flex flex-col gap-2">
      {outputs.map((output) => (
        <p className="text-sm h-48">
          <pre>{output.output}</pre>
        </p>
      ))}
    </div>
  );
}

export default PlaybookBashActionOutput;
