import requests
import json
import tensorflow as tf


rand = tf.random.uniform(shape=[1,256,256,3], dtype=tf.dtypes.float32)
rand = rand.numpy()

#server URL
#http://localhost:8501/v1/models/painter:predict
url = 'https://painter-image-gcrk6gkrcq-uc.a.run.app/v1/models/painter:predict'

def make_prediction(instances):
   data = json.dumps({"signature_name": "serving_default", "instances": instances.tolist()})
   headers = {"content-type": "application/json"}
   json_response = requests.post(url, data=data, headers=headers)
   predictions = json.loads(json_response.text)['predictions']
   return predictions

predictions = make_prediction(rand)
print(tf.convert_to_tensor(predictions))
print('Operation sucess')

