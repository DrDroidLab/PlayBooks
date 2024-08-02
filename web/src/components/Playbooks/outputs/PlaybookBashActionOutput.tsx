function PlaybookBashActionOutput({ output }) {
  const outputs = output.command_outputs;
  return (
    <div className="max-w-xl overflow-scroll bg-white p-2 border rounded flex flex-col gap-2">
      {outputs.map(
        (output) =>
          output.command && (
            <p className="text-sm h-48 overflow-scroll border rounded">
              <pre className="sticky top-0 border-b mb-1 bg-gray-50 p-1">
                {output.command}
              </pre>
              <pre className="p-1">{output.output}</pre>
            </p>
          ),
      )}
    </div>
  );
}

export default PlaybookBashActionOutput;
