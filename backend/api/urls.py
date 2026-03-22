from django.urls import path
from . import views

urlpatterns = [
    path('upload/document/', views.upload_document, name='upload_document'),
    path('qa/generate/', views.generate_qa, name='generate_qa'),
    path('qa/answer/', views.answer_qa, name='answer_qa'),
    path('upload/audio/', views.upload_audio, name='upload_audio'),
    path('evaluate/', views.evaluate_answers, name='evaluate_answers'),
]
