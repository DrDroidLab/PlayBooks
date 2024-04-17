import MDEditor from '@uiw/react-md-editor';

function Notes({ step }) {
  return (
    <div
      style={
        step.notes ? { display: 'flex', marginTop: '5px', marginBottom: '5px', gap: '5px' } : {}
      }
    >
      <div
        data-color-mode="light"
        style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
      >
        {step.notes && (
          <MDEditor.Markdown
            source={step.notes}
            height={100}
            style={{
              whiteSpace: 'pre-wrap',
              maxHeight: '200px',
              overflow: 'scroll',
              border: '1px solid black',
              borderRadius: '5px',
              padding: '1rem',
              width: '50%'
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Notes;
