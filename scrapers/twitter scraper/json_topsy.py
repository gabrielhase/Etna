import sys
import json 
import difflib
import urllib2
import datetime
import re
from pattern.vector import count, LEMMA
from pattern.en import parse, Sentence, sentiment
 
data_cont = {}
data_cont["title"]="Twitter feeds"
data_cont["description"]={"date":"day", "content":"text", "Sentiment":"float", "Stemming":"string"}
data_cont["tweets"]={}

data_cont_interrims=[]


for page in range(1,10):    
    url = "http://otter.topsy.com/search.json?q=vulcano%20OR%20etna&page="+str(page)+"&nohidden=0&perpage=100&allow_lang=en&apikey=4KS6YFR3VSP6HJUXM4KQAAAAAAIY6ICNMNIQAAAAAAAFQGYA"
    data = urllib2.urlopen(url)
    print page
    for i, tweet in enumerate(json.loads(data.read())["response"]["list"]):
        if "twitter" in tweet["topsy_author_url"]:
            ss = tweet["content"].replace("&#39;", "")
            s= "".join(re.findall(r"[A-Za-z0-9.!() ]*", ss))
            t = parse(s, lemmata=True)
            stem_tweet_ = []
            for e in str(t).split(' '):
                if not "http" in e:
                    if e.split('/')[0]!="":
                        print e.split('/')[4]
                        stem_tweet_.append(e.split('/')[4])
            stem_tweet = " ".join(stem_tweet_)

            tweet_date=datetime.datetime.fromtimestamp(int(tweet["firstpost_date"])).strftime('%Y-%m-%d %H:%M:%S')
            tweet_text=tweet["content"].replace("&#39;", "'")
            tweet_sentiment=str(sentiment(tweet["content"].replace("&#39;", "'"))[0])
     
                    
            data_cont_interrims.append([tweet_date, tweet_text, tweet_sentiment, stem_tweet])



data_cont["tweets"]=[ row for row in data_cont_interrims ] 

print json.dumps(data_cont)

f = open("twitter_feeds.json", 'a')
f.write(json.dumps(data_cont) + "\n")
f.close()