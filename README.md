About the Model
* This is a web-based application that allows users to upload PDFs in any language.
* The system extracts text using PDFPlumber and preprocesses it with regex for better structuring.
* Based on the document size, it dynamically selects either the T5 model or Google Gemini AI to generate relevant questions.
* For answering generated questions, it leverages TF-IDF vectorization and cosine similarity to retrieve the most relevant text segments.
* A translation layer enables users to interact in their preferred language, making the application accessible to a diverse audience.
* Users can ask follow-up questions, and the system prompts Gemini in a highly optimized manner to maintain context and provide accurate responses.
