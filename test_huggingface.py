import requests
import json

# Load test queries (manually copied or read from testQueries.js)
test_queries = [
    {"query": "Romance of the Three Kingdoms", "expected": "History"},
    {"query": "World War II", "expected": "History"},
    {"query": "algebra basics", "expected": "Mathematics Education"},
    # ... (copy all 200 queries from testQueries.js, or load programmatically)
    # For brevity, assuming the same 200 queries as in testQueries.js
]

# Test accuracy
def test_accuracy():
    correct = 0
    total = len(test_queries)
    incorrect_cases = []

    print("Testing query classification accuracy with Hugging Face...\n")
    for index, query_data in enumerate(test_queries):
        query = query_data["query"]
        expected = query_data["expected"]
        
        # Send query to microservice
        try:
            response = requests.post("http://localhost:8000/classify", json={"query": query})
            predicted = response.json().get("subject")
        except Exception as e:
            print(f"Error classifying query {query}: {e}")
            predicted = None

        is_correct = predicted == expected

        if is_correct:
            correct += 1
        else:
            incorrect_cases.append({
                "query": query,
                "expected": expected,
                "predicted": predicted
            })

        print(
            f"Query {index + 1}: \"{query}\"\n"
            f"  Expected: {expected or 'None'}\n"
            f"  Predicted: {predicted or 'None'}\n"
            f"  Correct: {'Yes' if is_correct else 'No'}\n"
        )

    accuracy = (correct / total) * 100
    print("\nSummary:")
    print(f"Total Queries: {total}")
    print(f"Correct Predictions: {correct}")
    print(f"Accuracy: {accuracy:.2f}%\n")

    if incorrect_cases:
        print("Incorrect Predictions:")
        for index, case in enumerate(incorrect_cases):
            print(
                f"{index + 1}. Query: \"{case['query']}\"\n"
                f"   Expected: {case['expected'] or 'None'}\n"
                f"   Predicted: {case['predicted'] or 'None'}\n"
            )
    else:
        print("No incorrect predictions.")

if __name__ == "__main__":
    test_accuracy()