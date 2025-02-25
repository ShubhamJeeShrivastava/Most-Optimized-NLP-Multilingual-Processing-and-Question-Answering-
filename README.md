**About the Model**
* This is a web-based application that allows users to upload PDFs in any language.
* The system extracts text using PDFPlumber and preprocesses it with regex for better structuring.
* Based on the document size, it dynamically selects either the **T5 model** or **Google Gemini AI** to generate relevant questions.
* For answering generated questions, it leverages TF-IDF vectorization and cosine similarity to retrieve the most relevant text segments.
* A **translation** layer enables users to interact in their preferred language, making the application accessible to a diverse audience.
* Users can ask **follow-up** questions, and the system prompts Gemini in a highly optimized manner to maintain context and provide accurate responses.


**Dependencies**

Install the required dependencies using the following command:

pip install -r requirements.txt

**Key Dependencies:**
transformers (for T5 model-based question generation)

pdfplumber (for extracting text from PDFs)

streamlit (for the web-based interface)

gemini-api (for accessing Google's Gemini LLM API)

pandas (for data handling and processing)

torch (for deep learning model execution)



**Clone the repository:**
git clone https://github.com/ShubhamJeeShrivastava/Most-Optimized-NLP-Multilingual-Processing-and-Question-Answering-.git

cd Most-Optimized-NLP-Multilingual-Processing-and-Question-Answering-

**Run the application:**
streamlit run app.py

Upload a PDF or input text directly to generate and validate questions.
