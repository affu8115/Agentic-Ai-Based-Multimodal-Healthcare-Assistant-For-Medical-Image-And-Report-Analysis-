import time
from abc import ABC, abstractmethod


class BaseAgent(ABC):
    """Abstract Base Class for specialized AI agents in the healthcare multi-agent pipeline."""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.status = "waiting"  # waiting, processing, completed, unable_to_process, requires_review
        self.execution_time_ms = 0
        self.error_message = None

    def run(self, payload: dict) -> dict:
        """Execute agent workflow with execution timing and error boundary."""
        self.status = "processing"
        start_time = time.time()
        self.error_message = None

        try:
            result = self.process(payload)
            self.execution_time_ms = int((time.time() - start_time) * 1000)
            self.status = "completed"
            return {
                'agent_name': self.name,
                'status': self.status,
                'execution_time_ms': self.execution_time_ms,
                'data': result,
                'error': None
            }
        except Exception as e:
            self.execution_time_ms = int((time.time() - start_time) * 1000)
            self.status = "unable_to_process"
            self.error_message = str(e)
            return {
                'agent_name': self.name,
                'status': self.status,
                'execution_time_ms': self.execution_time_ms,
                'data': None,
                'error': self.error_message
            }

    @abstractmethod
    def process(self, payload: dict) -> dict:
        """Subclasses must implement their specific agent reasoning logic."""
        pass
