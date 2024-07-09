import ast
import logging
import subprocess
import sys
import textwrap

from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class LambdaFunctionProcessor(Processor):
    client = None

    def __init__(self, function_definition, requirements):
        self.__requirements = requirements
        self.__function_definition = function_definition

    def install_packages(self, packages):
        for package in packages:
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            except subprocess.CalledProcessError as e:
                logger.error(f"Error installing {package}: {e}")
                continue

    def clean_and_get_function_executable(self):
        try:
            # Step 1: Remove leading/trailing whitespace
            func_str = self.__function_definition.strip()

            # Step 2: Unescape special characters (if necessary)
            # Uncomment the following line if you have escaped characters
            # func_str = func_str.encode().decode('unicode_escape')

            # Step 3: Fix indentation
            func_str = textwrap.dedent(func_str)

            # Step 4: Verify that it's a valid function definition
            try:
                parsed_func = ast.parse(func_str)
                if not any(isinstance(node, ast.FunctionDef) for node in parsed_func.body):
                    raise ValueError("The provided string is not a valid function definition.")
            except SyntaxError as e:
                raise SyntaxError(f"Syntax error in the provided function definition: {e}")
            # Step 5: Execute the function definition
            local_scope = {}
            exec(func_str, {}, local_scope)

            # Assuming the function name is the first function defined in the string
            func_name = parsed_func.body[0].name

            return local_scope[func_name]
        except Exception as e:
            logger.error(f"Exception occurred while fetching grafana data sources with error: {e}")
            raise e

    def execute(self, *args, **kwargs):
        try:
            if self.__requirements:
                self.install_packages(self.__requirements)
            exec_function = self.clean_and_get_function_executable()
            response = exec_function(*args, **kwargs)
            return response
        except Exception as e:
            logger.error(f"Exception occurred while exceuting lambda function with error: {e}")
            raise e
