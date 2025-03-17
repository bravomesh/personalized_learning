# curriculum_processor.py
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from typing import List, Optional

class CurriculumProcessor:
    """
    Processes curriculum PDFs and creates a searchable vector store.
    Handles multiple subjects and provides subject-specific context retrieval.
    """
    
    def __init__(self):
        """
        Initializes the processor with embeddings and an empty vector store.
        """
        self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        self.vectorstore = None  # Will hold the combined vector store

    def process_multiple_pdfs(self, pdf_paths: List[str]) -> Chroma:
        """
        Processes multiple PDFs and creates a unified vector store.
        
        Args:
            pdf_paths (List[str]): List of file paths to PDFs.
        
        Returns:
            Chroma: The created vector store.
        """
        all_docs = []  # Stores all processed document chunks
        
        for path in pdf_paths:
            # Extract subject from filename (assuming format: "subject_filename.pdf")
            subject = path.split("_")[0].lower()
            
            # Load and split PDF into pages
            loader = PyPDFLoader(path)
            pages = loader.load_and_split()
            
            # Add subject metadata to each page
            for page in pages:
                page.metadata["subject"] = subject
                
            # Split pages into smaller chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,  # 1000 characters per chunk
                chunk_overlap=200  # 200 characters overlap between chunks
            )
            split_docs = text_splitter.split_documents(pages)
            all_docs.extend(split_docs)
        
        # Create unified vector store with metadata
        self.vectorstore = Chroma.from_documents(
            documents=all_docs,
            embedding=self.embeddings,
            persist_directory="./chroma_db"  # Directory to store the vector database
        )
        return self.vectorstore

    def get_subject_context(self, query: str, subject: str, k: int = 3) -> List[str]:
        """
        Retrieves relevant context for a query within a specific subject.
        
        Args:
            query (str): The user's query.
            subject (str): The subject to filter by.
            k (int): Number of relevant chunks to return (default: 3).
        
        Returns:
            List[str]: List of relevant document chunks.
        """
        if not self.vectorstore:
            raise ValueError("Vector store not initialized. Call process_multiple_pdfs first.")
        
        # Search within specific subject documents
        results = self.vectorstore.similarity_search(
            query=query,
            filter={"subject": subject},  # Filter by subject metadata
            k=k  # Return top k relevant chunks
        )
        
        # Extract and return the page content from results
        return [doc.page_content for doc in results]

    def clear_vector_store(self):
        """
        Clears the current vector store and deletes the persisted data.
        """
        if self.vectorstore:
            self.vectorstore.delete_collection()
            self.vectorstore = None