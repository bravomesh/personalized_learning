"""
    Uncomment the above to have a filter saftey layer that is simpler and  is key key word based.
"""

# class SafetyLayer:
#     def __init__(self):
#         # Allowed subjects
#         self.allowed_subjects = ["mathematics", "chemistry", "biology", "physics", "english"]
        
#         self.educational_keywords = ["math", "science", "chemistry", "biology", "physics", "english", 
#  "learn", "teach", "study", "explain", "define", "calculate", 
#  "describe", "compare", "contrast", "analyze", "summarize", 
#  "demonstrate", "illustrate", "interpret", "discuss", "evaluate", 
#  "examine", "critique", "explore", "identify", "differentiate", 
#  "justify", "apply", "assess", "synthesize", "investigate", 
#  "outline", "provide evidence", "break down", "formulate", 
#  "predict", "solve", "clarify"]


#     def is_educational(self, query: str) -> bool:
#         """
#         Checks if the query contains educational keywords.
#         """
#         query = query.lower()
#         return any(keyword in query for keyword in self.educational_keywords)

#     def validate_query(self, query: str, subject: str) -> bool:
#         """
#         Validates the query based on subject and educational relevance.
#         """
#         # Check if subject is allowed
#         if subject.lower() not in self.allowed_subjects:
#             return False
        
#         # Check if query is educational
#         if not self.is_educational(query):
#             return False
        
#         return True

import requests

class SafetyLayer:
    def __init__(self, api_key: str):
        # API endpoint for the facebook/bart-large-mnli model
        self.api_url = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
        self.headers = {"Authorization": f"Bearer {api_key}"}

    def query_hf_inference(self, query: str, candidate_labels: list):
        """
        Sends a POST request to the Hugging Face Inference API with the provided query
        and candidate labels.
        """
        payload = {
            "inputs": query,
            "parameters": {"candidate_labels": candidate_labels}
        }
        response = requests.post(self.api_url, headers=self.headers, json=payload)
        return response.json()

    def is_educational(self, query: str, threshold: float = 0.7) -> bool:
        """
        Checks if the query is educational by using candidate labels.
        Returns True if the score for the 'educational' label exceeds the threshold.
        """
        candidate_labels = ["educational", "non-educational"]
        result = self.query_hf_inference(query, candidate_labels)
        for label, score in zip(result.get('labels', []), result.get('scores', [])):
            if label.lower() == "educational" and score > threshold:
                return True
        return False

    def is_query_for_subject(self, query: str, subject: str, threshold: float = 0.7) -> bool:
        """
        Checks if the context of the query fits the provided subject using candidate labels.
        It compares the subject label against a contrasting label ("not <subject>").
        Returns True if the subject label score exceeds the threshold.
        """
        candidate_labels = [subject, f"not {subject}"]
        result = self.query_hf_inference(query, candidate_labels)
        for label, score in zip(result.get('labels', []), result.get('scores', [])):
            if label.lower() == subject.lower() and score > threshold:
                return True
        return False

    def validate_query(self, query: str, subject: str) -> bool:
        """
        Validates the query by ensuring:
         1. The query is educational.
         2. The query's context fits the provided subject.
        Returns True only if both conditions are met.
        """
        if not self.is_educational(query):
            return False
        if not self.is_query_for_subject(query, subject):
            return False
        return True