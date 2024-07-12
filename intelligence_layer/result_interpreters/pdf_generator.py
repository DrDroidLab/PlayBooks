
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto
import pandas as pd
import os
from weasyprint import HTML
import markdown
from markdown_include.include import MarkdownInclude
from django.conf import settings
from utils.time_utils import current_epoch_timestamp
import uuid

def _html(markdown_file_name, css_file_name):
    with open(markdown_file_name, mode="r", encoding="utf-8") as markdown_file:
        with open(css_file_name, mode="r", encoding="utf-8") as css_file:
            markdown_input = markdown_file.read()
            css_input = css_file.read()

            markdown_path = os.path.dirname(markdown_file_name)
            markdown_include = MarkdownInclude(configs={"base_path": markdown_path})
            html = markdown.markdown(
                markdown_input, extensions=["extra", markdown_include, "meta", "tables"]
            )

            return f"""
            <html>
              <head>
                <style>{css_input}</style>
              </head>
              <body>{html}</body>
            </html>
            """

# def convert(md, css):
#     """Converts Markdown file MD and stylesheet CSS to HTML and PDF documents."""
#     _convert(md, css)
#     return 

def convert_md_to_pdf(markdown_file_name, css_file_name):
    file_name = os.path.splitext(markdown_file_name)[0]
    html_string = _html(markdown_file_name, css_file_name)

    with open(
        file_name + ".html", "w", encoding="utf-8", errors="xmlcharrefreplace"
    ) as output_file:
        output_file.write(html_string)

    markdown_path = os.path.dirname(markdown_file_name)
    html = HTML(string=html_string, base_url=markdown_path)
    html.write_pdf(file_name + ".pdf")
    pdf_file_path = file_name + ".pdf"
    return pdf_file_path


def save_md_file(md_file_content, file_path):
    try:
        with open(file_path, "w") as f:
            f.write(md_file_content)
            return os.path.abspath(file_path)
    except FileNotFoundError:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            f.write(md_file_content)
            return os.path.abspath(file_path)

def proto_to_markdown(execution_proto):
    md_file_content = ""
    step_number = 1
    for i, interpretation in enumerate(execution_proto):
        title = interpretation.title.value
        description = interpretation.description.value
        summary = interpretation.summary.value
        block_message = ""
        if description:
            block_message += f"{description}\n"
        if summary:
            block_message += f"{summary}\n"
        if(interpretation.model_type == InterpretationProto.ModelType.WORKFLOW_EXECUTION):
            if title:
                md_file_content += f'## {title}\n'
            if block_message:
                md_file_content += f'{block_message}\n'
        elif interpretation.model_type == InterpretationProto.ModelType.PLAYBOOK_STEP:
            md_file_content += '\n'
            md_file_content += f'### {step_number}. {title}\n'
            step_number += 1
        elif interpretation.model_type == InterpretationProto.ModelType.PLAYBOOK_TASK:
            if interpretation.type == InterpretationProto.Type.TEXT:
                md_file_content += f'{block_message}\n'
            elif interpretation.type == InterpretationProto.Type.IMAGE:
                md_file_content += f'{description}\n'
                alt_content = description.replace("`", "")
                md_file_content += f' ![{alt_content}]({interpretation.file_path.value})\n  '
            elif interpretation.type == InterpretationProto.Type.CSV_FILE:
                md_file_content += f'{description}\n'
                # read csv
                # print it row by row as markdown table
                csv_file = pd.read_csv(interpretation.file_path.value)
                if '@ptr' in csv_file.columns:
                    csv_file = csv_file.drop('@ptr', axis=1)
                column_view = ''
                row_view = ''
                divider_view = ''
                column_counter = 0
                for column in csv_file.columns:
                    column_counter += 1
                    row_view += f' | {column} '
                    divider_view += ' | --- '
                    if column_counter > 5:
                        break
                row_view += ' | \n'
                divider_view += ' | \n'
                column_view += row_view
                column_view += divider_view
                row_counter = 0
                for index, row in csv_file.iterrows():
                    row_counter += 1
                    row_view = ''
                    column_counter = 0
                    for i, value in enumerate(row):
                        column_counter += 1
                        if (len(str(value)) > 140):
                            value = str(value)[:140] + '...'
                        row_view += ' | '+str(value)
                        if column_counter > 5:
                            break
                    row_view += ' | \n'
                    column_view += row_view
                    if row_counter > 10:
                        md_file_content +=" \n Content Truncated. Please see remaining content in file. \n"
                        break
                md_file_content += '\n'
                md_file_content += column_view
                md_file_content += '\n'
                md_file_content += f' \n File URL: {interpretation.object_url.value}\n'
                    # md_file_content += '|'.join(row) + '\n'
            elif interpretation.type == InterpretationProto.Type.JSON:
                md_file_content += f" ```{summary}```\n"
    return md_file_content

def generate_pdf(execution_output):
    
    md_file_content = proto_to_markdown(execution_output)
    current_epoch = current_epoch_timestamp()
    uuid_str = uuid.uuid4().hex
    file_name = f'workflow_execution_pdf_{str(current_epoch)}_{uuid_str}.md'
    md_file_path = os.path.join(settings.MEDIA_ASSETS_ROOT,os.path.join('files', file_name))

    saved_md_file_path = save_md_file(md_file_content,md_file_path)
    styling_file = os.path.join(settings.STYLING_FILE,'style.css')

    pdf_file_path = convert_md_to_pdf(saved_md_file_path, styling_file)
    return pdf_file_path
