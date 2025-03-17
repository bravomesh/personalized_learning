class SafetyLayer:
    def __init__(self):
        self.allowed_subjects = ["mathematics", "chemistry", "biology", "physics", "english"]
    
    def validate_query(self, query, subject):
        subject = subject.lower()
        if subject not in self.allowed_subjects:
            return False
        return True