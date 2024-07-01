from engines.query_engine.filters.filter_token import FilterTokenizer, FilterTokenValidator, FilterTokenEvaluator, FilterToken
from protos.engines.query_base_pb2 import Filter as FilterProto


class FilterEngine:
    def __init__(self, columns):
        self.columns = columns
        self._filter_tokenizer = FilterTokenizer(columns)
        self._filter_token_validator = FilterTokenValidator()
        self._filter_token_evaluator = FilterTokenEvaluator()

    def tokenize(self, filter_proto: FilterProto) -> FilterToken:
        return self._filter_tokenizer.tokenize(filter_proto)

    def validate(self, filter_token: FilterToken) -> (bool, str):
        return self._filter_token_validator.validate(filter_token)

    def evaluate(self, qs, filter_token: FilterToken):
        return self._filter_token_evaluator.process(qs, filter_token)

    def process(self, qs, filter_proto: FilterProto):
        filter_token: FilterToken = self.tokenize(filter_proto)
        if not filter_token:
            return qs
        query_validation_check, err = self.validate(filter_token)
        if not query_validation_check:
            raise ValueError(err)
        return self.evaluate(qs, filter_token)
