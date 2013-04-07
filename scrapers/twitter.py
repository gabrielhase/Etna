import os, sys; sys.path.insert(0, os.path.join("..", ".."))
import difflib
from pattern.web import Twitter, hashtags
from pattern.db  import Datasheet, pprint
from pattern.en import sentiment


try: 
    # We store tweets in a Datasheet that can be saved as a text file (comma-separated).
    # In the first column, we'll store a unique ID for each tweet.
    # We only want to add the latest tweets, i.e., those we haven't previously encountered.
    # With an index on the first column we can quickly check if an ID already exists.
    # The index becomes important once more and more rows are added to the table (speed).
    table = Datasheet.load("tweets.csv")
    index = dict.fromkeys(table.columns[0], True)
    index2 = dict.fromkeys(table.columns[1], True)
except:
    table = Datasheet()
    index = {}
    index2 = {}


engine = Twitter(language="en")
comparray=[" "] #spam filter 
# With cached=False, a live request is sent to Twitter,
# so we get the latest results for the query instead of those in the local cache.
for i in range(1, 10000):
    for tweet in Twitter().search('volcano OR Sicily AND etna +exclude:retweets', start=i, count=100):
        comparray.append(tweet.text[0:15])
        print tweet.text
        print tweet.author
        print tweet.date
        print hashtags(tweet.text) # Keywords in tweets start with a #.
        print
        # Create a unique ID based on the tweet content and author.
        id = str(hash(tweet.author + tweet.text))
        # Only add the tweet to the table if it doesn't already contain this ID.     
        if len(table) == 0 or id not in index and sentiment(tweet.text)[0]!= 0 and comparray[-1]!=comparray[-2]:
            table.append([id,tweet.author, tweet.date, tweet.text, sentiment(tweet.text)[0]])
            index[id] = True

table.save("tweets.csv")

print "Total results:", len(table)
print
