import os
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.conf import settings
from .services import (
    extract_clean_text_chunks_from_pdf, retrieve_relevant_chunks,
    generate_questions_t5, generate_questions_gemini,
    generate_answers_for_questions_gemini, generate_summary,
    generate_followup, transcribe_audio_gemini, evaluate_generation
)
from googletrans import Translator

translator = Translator()

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_document(request):
    try:
        file_obj = request.FILES.get('file')
        lang = request.POST.get('lang', 'en')
        
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=400)
            
        file_path = default_storage.save('temp/' + file_obj.name, file_obj)
        full_path = default_storage.path(file_path)
        
        chunks = extract_clean_text_chunks_from_pdf(full_path)
        context = " ".join(chunks)
        
        # Cleanup
        os.remove(full_path)
        
        return Response({"message": "Document parsed successfully", "context": context, "chunks": chunks})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@parser_classes([JSONParser])
def generate_qa(request):
    try:
        context = request.data.get('context', '')
        prompt = request.data.get('prompt', '')
        use_t5 = request.data.get('use_t5', False)
        lang = request.data.get('lang', 'en')
        
        if not context:
            return Response({"error": "Context is required"}, status=400)
            
        relevant_chunks = retrieve_relevant_chunks(prompt, [context], top_n=5)
        agg_text = " ".join(relevant_chunks) if relevant_chunks else context
        
        if use_t5:
            questions = generate_questions_t5(agg_text, num_questions=5)
        else:
            questions = generate_questions_gemini(agg_text, num_questions=5)
            
        answers = generate_answers_for_questions_gemini(questions, context)
        
        valid_qa = {}
        for q in questions:
            if q in answers:
                valid_qa[q] = answers[q]
                
        # Translation
        if lang != 'en':
            translated_qa = {}
            for q, a in valid_qa.items():
                t_q = translator.translate(q, dest=lang).text
                t_a = translator.translate(a, dest=lang).text
                translated_qa[t_q] = t_a
            valid_qa = translated_qa
            
        summary = generate_summary(context, 50, lang)
        
        return Response({
            "qa_pairs": valid_qa,
            "summary": summary
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@parser_classes([JSONParser])
def answer_qa(request):
    try:
        question = request.data.get('question', '')
        original_answer = request.data.get('original_answer', '')
        followup = request.data.get('followup', '')
        context = request.data.get('context', '')
        lang = request.data.get('lang', 'en')
        
        if lang != "en":
            followup = translator.translate(followup, dest="en").text
            
        response_text = generate_followup(question, original_answer, followup, context)
        
        if lang != "en":
            response_text = translator.translate(response_text, dest=lang).text
            
        return Response({"answer": response_text})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_audio(request):
    try:
        audio_file = request.FILES.get('file')
        if not audio_file:
            return Response({"error": "No audio file uploaded"}, status=400)
            
        file_path = default_storage.save('temp/' + audio_file.name, audio_file)
        full_path = default_storage.path(file_path)
        
        transcription = transcribe_audio_gemini(full_path)
        
        # Cleanup
        os.remove(full_path)
        
        return Response({"transcription": transcription, "context": transcription})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@parser_classes([JSONParser])
def evaluate_answers(request):
    try:
        reference = request.data.get('reference', '')
        generated = request.data.get('generated', '')
        
        metrics = evaluate_generation(reference, generated)
        return Response(metrics)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
