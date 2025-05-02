using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.Networking;

public class SocketUnity : MonoBehaviour
{
    private string serverUrl = "http://localhost:5005/cleo-latest";

    public Animator controller;
    public GameObject TextBackground;
    public TextMeshProUGUI text;


    void Start()
    {
        StartCoroutine(CheckCleoMessage());
    }

    public void Update()
    {
        if (Input.GetKeyDown(KeyCode.B))
        {
            Debug.Log("Buy");
            ProcessMessage("One Cleo NFT just got bought!");
        }
        if (Input.GetKeyDown(KeyCode.L))
        {
            Debug.Log("Listed");
            ProcessMessage("One Cleo NFT just got listed!");
        }
    }

    IEnumerator CheckCleoMessage()
    {
        while (true)
        {
            UnityWebRequest www = UnityWebRequest.Get(serverUrl);
            yield return www.SendWebRequest();

            if (www.result == UnityWebRequest.Result.Success)
            {
                string json = www.downloadHandler.text;
                CleoResponse response = JsonUtility.FromJson<CleoResponse>(json);

                if (!string.IsNullOrEmpty(response.message))
                {
                    ProcessMessage(response.message);
                }
            }
            else
            {
                Debug.LogError("Request error: " + www.error);
            }

            yield return new WaitForSeconds(2f); // Attends 2 secondes avant la prochaine requête
        }
    }

    private void ProcessMessage(string message)
    {
        //Debug.Log("Cleo says: " + response.message);
        // TODO: Déclenche un événement ou une animation ici
        StartCoroutine(ShowMessage(message));

        if (message == "One Cleo NFT just got bought!")
            controller.SetTrigger("Buy");
        else if (message == "One Cleo NFT just got listed!")
            controller.SetTrigger("Listed");
        else
            controller.SetTrigger("Speak");
    }

    private IEnumerator ShowMessage(string message)
    {
        TextBackground.SetActive(true);
        text.text = message;

        yield return new WaitForSeconds(5f);

        TextBackground.SetActive(false);
        text.text = "";

    }

    [System.Serializable]
    public class CleoResponse
    {
        public string message;
    }
}
