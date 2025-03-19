from transformers import pipeline

class SafetyLayer:
    def __init__(self):
        # Allowed subjects
        self.allowed_subjects = ["mathematics", "chemistry", "biology", "physics", "english"]
        
        # Load a pre-trained model for educational content classification
        self.classifier = pipeline(
            "text-classification",
            model="distilbert-base-uncased",
            tokenizer="distilbert-base-uncased"
        )

    def is_educational(self, query: str) -> bool:
        """
        Checks if the query is educational using a pre-trained model.
        """
        try:
            # Classify the query
            result = self.classifier(query)[0]
            # Assume label "EDUCATIONAL" for educational content
            return result["label"] == "EDUCATIONAL" and result["score"] > 0.7
        except Exception:
            # Fallback to a simple keyword-based check if the model fails
            educational_keywords = ["math", "science", "chemistry", "biology", "physics", "english", "learn", "teach", "study"]
            return any(keyword in query.lower() for keyword in educational_keywords)

    def validate_query(self, query: str, subject: str) -> bool:
        """
        Validates the query based on subject and educational relevance.
        """
        # Check if subject is allowed
        if subject.lower() not in self.allowed_subjects:
            return False
        
        # Check if query is educational
        if not self.is_educational(query):
            return False
        
        return True