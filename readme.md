# Ai Camera Project
This is a learning project I did to learn every step of making a machine learning app.  Particularily, the goal is training machine learning models and serving them using cloud technologies for webapp access.
The app focuses on machine vision, and particulariy image translation.  Each model translates source images into a target domain of impressionist style.  
* [Link to website](https://ai-camera-production-gcrk6gkrcq-uc.a.run.app/)

# Machine Learning Models
This project uses 3 machine learning architectures, created and trained with Tensorflow in Python: 
* [Cycle-Gan](https://arxiv.org/abs/1703.10593) with U-Net model architecture, and with Res-net architecture (Res-net models still work in progress due to my computation time restraints)
* [Fast-Neural-Style-Transfer](https://arxiv.org/abs/1603.08155)

# Machine Learning Serving Details
The models are served using Docker and the Tensorflow Extended Model Server Docker image.  The Docker images are hosted on Google Cloud Services, and run on Google Cloud Run.  I chose these technologies because they are the most customizable, efficient and cost effective approach I found, amongst the many techniques I tried.

# Web App Details
The webapp server is a NodeJS Express server, also packaged into a Docker image and hosted on Google Cloud Run.  Image preprocessing is done on the front end with Tensorflow JS, and then image data is posted to the server.  After machine learning inference, the image data postprocessing also happens on the front end.

# Datasets used for model training
* https://www.kaggle.com/ipythonx/van-gogh-paintings
* https://www.kaggle.com/arnaud58/landscape-pictures
* [Coco 2014 train dataset](https://cocodataset.org/)

# Technology Stack
Python, Javascript, NodeJs, Express, Tensorflow + TFJS + TFX, Docker, Google Cloud Run, HTML, CSS

# TODO
* Verification of image data before posting
* Train Res-net models using mixed precision to surmout speed limitations 
* Clean up webapp HTML page; make it look good
