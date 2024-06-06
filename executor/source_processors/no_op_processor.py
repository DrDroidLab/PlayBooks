from executor.source_processors.processor import Processor


# This is a no-op processor that does nothing
class NoOpProcessor(Processor):
    def no_op_call(self):
        pass
